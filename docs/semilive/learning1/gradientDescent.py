from numpy import *
from numpy.random import *

def gradientDescent(F, dF, d):
    # F is the function
    # dF is the gradient
    # d is the dimension
    w = zeros(d)
    eta = 0.01
    for t in range(1000):
        value = F(w)
        gradient = dF(w)
        print('t = {}, value = {}, w = {}'.format(t, value, w))
        w = w - eta * gradient

def stochasticGradientDescent(sF, sdF, d, n):
    # F is the function
    # dF is the gradient
    # d is the dimension
    # n is the number of datapoints
    w = zeros(d)
    eta = 0.01
    for t in range(10):
        for i in range(n):
            value = sF(w, i)
            gradient = sdF(w, i)
            w = w - eta * gradient
        print('t = {}, value = {}, w = {}'.format(t, value, w))

# Generating synthetic data
true_w = array([1., 2., 3., 4., 5.])
d = len(true_w)
points = []
for t in range(10000):
    x = randn(d)
    y = x.dot(true_w) + randn()
    points.append((x, y))

def F(w):
    return sum((x.dot(w) - y)**2 for x, y in points) / len(points)

def dF(w):
    return sum(2*(x.dot(w) - y)*x for x, y in points) / len(points)

def sF(w, i):
    x, y = points[i]
    return (x.dot(w) - y)**2

def sdF(w, i):
    x, y = points[i]
    return 2*(x.dot(w) - y)*x

# gradientDescent(F, dF, d)
stochasticGradientDescent(sF, sdF, d, len(points))
