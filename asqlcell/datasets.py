import pandas as pd
import numpy as np

def get_random_data(number = 10):
    return pd.DataFrame(
        data = {
            "id": np.arange(number),
            "price": [np.random.rand() * 100 for i in range(number)],
            "normal": [True for i in range(number)]
        },
        index = np.arange(number)
    )
