#!/usr/bin/env python3

import matplotlib
import matplotlib.pyplot as plt
import echonet
import os

root = "output/video"
fig_root = "figure/hyperparameter"

echonet.utils.latexify()

os.makedirs(fig_root, exist_ok=True)

def load(model, frames, period, pretrained):
    try:
        with open(os.path.join(root, "{}_{}_{}_{}".format(model, frames, period, "pretrained" if pretrained else "random"), "log.csv"), "r") as f:
            for l in f:
                if "Best validation loss " in l:
                    return float(l.split()[3])
    except:
        pass

fig = plt.figure(figsize=(1.1, 2.75))
for (model, color) in zip(["R2+1D", "R3D", "MC3"], matplotlib.colors.TABLEAU_COLORS):
    plt.plot([float("nan")], [float("nan")], "-", color=color, label=model)
plt.plot([float("nan")], [float("nan")], "-", color="k", label="Pretrained")
plt.plot([float("nan")], [float("nan")], "--", color="k", mfc="none", label="Random")
plt.title("")
plt.axis("off")
plt.legend(loc="center")
plt.tight_layout()
plt.savefig(os.path.join(fig_root, "legend.pdf"))
plt.savefig(os.path.join(fig_root, "legend.png"))
plt.close(fig)

print("FRAMES")
FRAMES = [1, 8, 16, 32, 64, 96]
fig = plt.figure(figsize=(2.5, 2.75))
for (model, color) in zip(["r2plus1d_18", "r3d_18", "mc3_18"], matplotlib.colors.TABLEAU_COLORS):
    for pretrained in [True, False]:
        loss = [load(model, frames, 1, pretrained) for frames in FRAMES]
        print(model, pretrained)
        print(list(map(lambda x: "{:.1f}".format(x) if x is not None else None, loss)))

        plt.plot(FRAMES, loss, "-" if pretrained else "--",  marker=".", color=color)
plt.xticks(FRAMES)
plt.xlabel("Clip length (frames)\n\n(a)")
plt.ylabel("Validation Loss")
plt.tight_layout()
plt.savefig(os.path.join(fig_root, "length.pdf"))
plt.savefig(os.path.join(fig_root, "length.png"))
plt.close(fig)

print("PERIOD")
PERIOD = [1, 2, 4, 6, 8]
fig = plt.figure(figsize=(2.5, 2.75))

for (model, color) in zip(["r2plus1d_18", "r3d_18", "mc3_18"], matplotlib.colors.TABLEAU_COLORS):
    for pretrained in [True, False]:
        loss = [load(model, 64 // period, period, pretrained) for period in PERIOD]
        print(model, pretrained)
        print(list(map(lambda x: "{:.1f}".format(x) if x is not None else None, loss)))

        plt.plot(PERIOD, loss, "-" if pretrained else "--",  marker=".", color=color)
plt.xticks(PERIOD)
plt.xlabel("Sampling Period (frames)\n\n(b)")
plt.ylabel("Validation Loss")
plt.tight_layout()
plt.savefig(os.path.join(fig_root, "period.pdf"))
plt.savefig(os.path.join(fig_root, "period.png"))
plt.close(fig)

