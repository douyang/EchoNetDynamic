points = [(2, 4), (4, 2)]

def F(w):
    return sum((x * w - y)**2 for x, y in points)

def dF(w):
    return sum(2*(x * w - y)*x for x, y in points)

# Do gradient descent
w = 0.
eta = 0.01
for t in range(50):
    value = F(w)
    gradient = dF(w)
    print('t = {}, w = {}, F(w) = {}'.format(t, w, value))
    w = w - eta * gradient
