#!/usr/bin/env python3

import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import echonet
import os
import math
import torch
import tqdm

root = "output"
fig_root = "figure/training"
TRAIN = [32, 64, 128, 256, 512, 1024, 2048, 4096, 7460]

dataset = echonet.datasets.Echo(target_type=["LargeTrace", "SmallTrace"], split="train", length=0)
loader = torch.utils.data.DataLoader(dataset, num_workers=8, batch_size=16)
n = 0
trace = 0
for (X, (ltrace, strace)) in tqdm.tqdm(loader):
    n += 2 * X.shape[0]
    trace += ltrace.sum(0).numpy()
    trace += strace.sum(0).numpy()

trace /= n
trace = trace > 0.5

union = 0
inter = 0
dataset = echonet.datasets.Echo(target_type=["LargeTrace", "SmallTrace"], split="test", length=0)
loader = torch.utils.data.DataLoader(dataset, num_workers=8, batch_size=16)
for (X, (ltrace, strace)) in tqdm.tqdm(loader):
    union += np.logical_or(trace, ltrace).numpy().sum()
    union += np.logical_or(trace, strace).numpy().sum()
    inter += np.logical_and(trace, ltrace).numpy().sum()
    inter += np.logical_and(trace, strace).numpy().sum()

echonet.utils.latexify()

os.makedirs(fig_root, exist_ok=True)

def load_video(train):
    try:
        with open(os.path.join(root, "training_size", "video", str(train), "log.csv"), "r") as f:
            for l in f:
                if "test (one crop) R2" in l:
                    return float(l.split()[4])
    except:
        pass

def load_seg(train):
    try:
        with open(os.path.join(root, "training_size", "segmentation", str(train), "log.csv"), "r") as f:
            for l in f:
                if "test dice (overall)" in l:
                    return float(l.split()[3])
    except:
        pass

fig, ax = plt.subplots(2, figsize=(4.0, 2.75), sharex=True)

r2 = [load_video(train) for train in TRAIN]
print(r2)
ax[0].semilogx(TRAIN, r2, basex=2, color="k", linewidth=1, marker=".")
ax[0].set_ylabel("R$^2$")
ax[0].set_ylim([0, 1])

dice = [load_seg(train) for train in TRAIN]
print(dice)
ax[1].semilogx(TRAIN, dice, basex=2, color="k", linewidth=1, marker=".")
ax[1].set_ylabel("DSC")
ax[1].set_xlabel("Training Patients")
ax[1].set_ylim([2 * inter / (inter + union), 1])
print(2 * inter / (inter + union))
plt.xticks(TRAIN, TRAIN)

plt.tight_layout()
plt.savefig(os.path.join(fig_root, "training_size.pdf"))
plt.savefig(os.path.join(fig_root, "training_size.png"))
plt.close(fig)
