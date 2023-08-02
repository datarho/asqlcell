import React from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { Order } from "../const";

export const OrderIcons: Record<Order, JSX.Element> = {
    [Order.Increasing]: <FaSortUp color="gray" size={10} />,
    [Order.Descending]: <FaSortDown color="gray" size={10} />,
    [Order.None]: <FaSort color="lightgray" size={10} />
}
