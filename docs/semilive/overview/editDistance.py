def editDistance(s, t):
    cache = {} # subproblem (m, n) => solution
    def recurse(m, n):
        # Should return the edit distance between
        # - first m characters of s, and
        # - first n characters of t
        if (m, n) in cache:
            return cache[(m, n)]
        if m == 0:
            result = n
        elif n == 0:
            result = m
        elif s[m-1] == t[n-1]:
            result = recurse(m-1, n-1)
        else:
            insCost = 1 + recurse(m, n-1)
            delCost = 1 + recurse(m-1, n)
            subCost = 1 + recurse(m-1, n-1)
            result = min(insCost, delCost, subCost)
        cache[(m, n)] = result
        return result

    return recurse(len(s), len(t))

print(editDistance('a cat!' * 20, 'the cats!' * 20))
