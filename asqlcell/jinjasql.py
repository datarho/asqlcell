from collections import OrderedDict
from threading import local

import markupsafe
from jinja2 import Environment, Template
from jinja2.ext import Extension
from jinja2.lexer import Token

_thread_local = local()


class JinjaSqlException(Exception):
    pass


class InvalidBindParameterException(JinjaSqlException):
    pass


class SqlExtension(Extension):
    def extract_param_name(self, tokens):
        name = ""
        for token in tokens:
            if token.test("variable_begin"):
                continue
            elif token.test("name"):
                name += token.value
            elif token.test("dot"):
                name += token.value
            else:
                break
        if not name:
            name = "bind#0"
        return name

    def filter_stream(self, stream):
        """
        We convert
        {{ some.variable | filter1 | filter 2}}
            to
        {{ ( some.variable | filter1 | filter 2 ) | bind}}

        ... for all variable declarations in the template
        Note the extra ( and ). We want the | bind to apply to the entire value, not just the last value.
        The parentheses are mostly redundant, except in expressions like {{ '%' ~ myval ~ '%' }}
        This function is called by jinja2 immediately
        after the lexing stage, but before the parser is called.
        """
        while not stream.eos:
            token = next(stream)
            if token.test("variable_begin"):
                var_expr = []
                while not token.test("variable_end"):
                    var_expr.append(token)
                    token = next(stream)
                variable_end = token

                last_token = var_expr[-1]
                lineno = last_token.lineno
                # don't bind twice
                if not last_token.test("name") or last_token.value not in ("bind", "inclause", "sqlsafe"):
                    param_name = self.extract_param_name(var_expr)

                    var_expr.insert(1, Token(lineno, "lparen", "("))
                    var_expr.append(Token(lineno, "rparen", ")"))
                    var_expr.append(Token(lineno, "pipe", "|"))
                    var_expr.append(Token(lineno, "name", "bind"))
                    var_expr.append(Token(lineno, "lparen", "("))
                    var_expr.append(Token(lineno, "string", param_name))
                    var_expr.append(Token(lineno, "rparen", ")"))

                var_expr.append(variable_end)
                for token in var_expr:
                    yield token
            else:
                yield token


def sql_safe(value):
    """Filter to mark the value of an expression as safe for inserting
    in a SQL statement"""
    return markupsafe.Markup(value)


def bind(value, name):
    """A filter that prints %s, and stores the value
    in an array, so that it can be bound using a prepared statement
    This filter is automatically applied to every {{variable}}
    during the lexing stage, so developers can't forget to bind
    """
    if isinstance(value, markupsafe.Markup):
        return value
    else:
        return _bind_param(_thread_local.bind_params, name, value)


def bind_in_clause(value):
    values = list(value)
    results = []
    for v in values:
        results.append(_bind_param(_thread_local.bind_params, "inclause", v))

    clause = ",".join(results)
    return clause


def _bind_param(already_bound, key, value):
    _thread_local.param_index += 1
    new_key = "%s_%s" % (key, _thread_local.param_index)
    already_bound[new_key] = value

    param_style = _thread_local.param_style
    if param_style == "qmark":
        return "?"
    elif param_style == "format":
        return "%s"
    elif param_style == "numeric":
        return ":%s" % _thread_local.param_index
    elif param_style == "named":
        return ":%s" % new_key
    elif param_style == "pyformat":
        return "%%(%s)s" % new_key
    elif param_style == "asyncpg":
        return "$%s" % _thread_local.param_index
    else:
        raise AssertionError("Invalid param_style - %s" % param_style)


def requires_in_clause(obj):
    return isinstance(obj, (list, tuple))


def is_dictionary(obj):
    return isinstance(obj, dict)


class JinjaSql(object):
    # See PEP-249 for definition
    # qmark "where name = ?"
    # numeric "where name = :1"
    # named "where name = :name"
    # format "where name = %s"
    # pyformat "where name = %(name)s"
    # asyncpg "where name = $1"
    VALID_PARAM_STYLES = ("qmark", "numeric", "named", "format", "pyformat", "asyncpg")

    def __init__(self, env=None, param_style="format"):
        self.env = env or Environment()
        self._prepare_environment()
        self.param_style = param_style

    def _prepare_environment(self):
        self.env.autoescape = True
        self.env.add_extension(SqlExtension)
        self.env.filters["bind"] = bind
        self.env.filters["sqlsafe"] = sql_safe
        self.env.filters["inclause"] = bind_in_clause

    def prepare_query(self, source, data):
        if isinstance(source, Template):
            template = source
        else:
            template = self.env.from_string(source)

        return self._prepare_query(template, data)

    def _prepare_query(self, template, data):
        try:
            _thread_local.bind_params = OrderedDict()
            _thread_local.param_style = self.param_style
            _thread_local.param_index = 0
            query = template.render(data)
            bind_params = _thread_local.bind_params
            if self.param_style in ("named", "pyformat"):
                bind_params = dict(bind_params)
            elif self.param_style in ("qmark", "numeric", "format", "asyncpg"):
                bind_params = list(bind_params.values())
            return query, bind_params
        finally:
            del _thread_local.bind_params
            del _thread_local.param_style
            del _thread_local.param_index
