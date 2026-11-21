N = {}
def B(name, text):
    d = {}
    for l in text.strip().split("\n"):
        k, v = l.split("|", 1); d[int(k)] = v.strip()
    assert sorted(d) == list(range(1, len(d) + 1)), name
    N[name] = [d[i] for i in range(1, len(d) + 1)]
