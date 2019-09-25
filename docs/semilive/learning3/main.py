import submission, util
from collections import defaultdict

# Read data

trainExamples = util.readExamples('names.train')
devExamples = util.readExamples('names.dev')

# Features

def features(x):
    # the Senate .

    phi = defaultdict(float)
    phi['bias'] = 1.
    tokens = x.split()
    left, entity, right = tokens[0], tokens[1:-1], tokens[-1]
    phi['entity is '+str(entity)] = 1.
    phi['left is '+left] = 1.
    phi['right is '+right] = 1.
    for word in entity:
        phi['entity contains '+word] = 1.
    return phi

# Train

weights = submission.learnPredictor(trainExamples, devExamples, features, 100, 0.01)
util.outputWeights(weights, 'weights')
util.outputErrorAnalysis(devExamples, features, weights, 'error-analysis')


# Test

testExamples = util.readExamples('names.test')
predictor = lambda x: 1 if util.dotProduct(weights, features(x))>=0 else -1
print util.evaluatePredictor(testExamples, predictor)
