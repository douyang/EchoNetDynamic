# Run EM algorithm on a simple two-view mixture model from the lecture notes.
# The algorithm doesn't converge to anything interesting.
# Should choose something more interesting.

pc = 0.5
pc1 = 0.4
pd1 = 0.6

for i in range(100):
    # E-step
    q1c = pc * (1-pc1) * (1-pc1)
    q1d = (1-pc) * (1-pd1) * (1-pd1)
    q1c, q1d = q1c / (q1c+q1d), q1d / (q1c+q1d)

    q2c = pc * pc1 * (1-pc1)
    q2d = (1-pc) * pd1 * (1-pd1)
    q2c, q2d = q2c / (q2c+q2d), q2d / (q2c+q2d)

    print 'q:', q1c, q1d, q2c, q2d

    # M-step
    wc = q1c + q2c
    wd = q1d + q2d
    pc = wc / (wc + wd)

    wc1 = q2c
    wc2 = q1c + q1c + q2c
    pc1 = wc1 / (wc1 + wc2) 

    wd1 = q2d
    wd2 = q1d + q1d + q2d
    pd1 = wd1 / (wd1 + wd2) 

    print 'theta:', pc, pc1, pd1

