import os

### Model (MDP problem)

class TransportationMDP(object):
    def __init__(self, N):
        # N = number of blocks
        self.N = N
    def startState(self):
        return 1
    def isEnd(self, state):
        return state == self.N
    def actions(self, state):
        # return list of valid actions
        result = []
        if state+1<=self.N:
            result.append('walk')
        if state*2<=self.N:
            result.append('tram')
        return result
    def succProbReward(self, state, action):
        # return list of (newState, prob, reward) triples
        # state = s, action = a, newState = s'
        # prob = T(s, a, s'), reward = Reward(s, a, s')
        result = []
        if action=='walk':
            result.append((state+1, 1., -1.))
        elif action=='tram':
            failProb = 0.9
            result.append((state*2, 1.-failProb, -2.))
            result.append((state, failProb, -2.))
        return result
    def discount(self):
        return 1.
    def states(self):
        return range(1, self.N+1)

# Inference (Algorithms)

def valueIteration(mdp):
    # initialize
    V = {} # state -> Vopt[state]
    for state in mdp.states():
        V[state] = 0.

    def Q(state, action):
        return sum(prob*(reward + mdp.discount()*V[newState]) \
                for newState, prob, reward in mdp.succProbReward(state, action))

    while True:
        # compute the new values (newV) given the old values (V)
        newV = {}
        for state in mdp.states():
            if mdp.isEnd(state):
                newV[state] = 0.
            else:
                newV[state] = max(Q(state, action) for action in mdp.actions(state))
        # check for convergence
        if max(abs(V[state]-newV[state]) for state in mdp.states())<1e-10:
            break
        V = newV

        # read out policy
        pi = {}
        for state in mdp.states():
            if mdp.isEnd(state):
                pi[state] = 'none'
            else:
                pi[state] = max((Q(state, action), action) for action in mdp.actions(state))[1]

        # print stuff out
        os.system('clear')
        print('{:20} {:20} {:20}'.format('s', 'V(s)', 'pi(s)'))
        for state in mdp.states():
            print('{:20} {:20} {:20}'.format(state, V[state], pi[state]))
        input()


mdp = TransportationMDP(N=10)
#print(mdp.actions(3))
#print(mdp.succProbReward(3, 'walk'))
#print(mdp.succProbReward(3, 'tram'))
valueIteration(mdp)
