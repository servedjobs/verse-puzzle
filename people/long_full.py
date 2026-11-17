import importlib
LONG = {}
for n in range(1, 12):
    try: m = importlib.import_module(f"long_full{n}")
    except ModuleNotFoundError: continue
    LONG.update(m.LONG)
