import random

def kmeans(points, K):
    n = len(points)
    # Cluster centroids
    mu = [points[random.randint(0, n-1)] for _ in range(K)]
    # Cluster assignments
    z = [None]*n

    for t in range(10):
        # Step 1: set assignments (z)
        totalCost = 0.
        for i in range(n):
            cost, z[i] = min([((points[i]-mu[k])**2, k) for k in range(K)])
            totalCost += cost
        print('totalCost = {}, mu = {}'.format(totalCost, mu))
        # Step 2: set centroids (mu)
        for k in range(K):
            clusterPoints = [points[i] for i in range(n) if z[i]==k]
            if len(clusterPoints)>0:
                mu[k] = float(sum(clusterPoints))/len(clusterPoints)


points = [0, 2, 10, 12]
kmeans(points, K=2)
