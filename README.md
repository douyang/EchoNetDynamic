EchoNet-Dynamic:<br/>Interpretable AI for beat-to-beat cardiac function assessment
------------------------------------------------------------------------------

EchoNet-Dynamic is a end-to-end beat-to-beat deep learning model for
  1) semantic segmentation of the left ventricle
  2) prediction of ejection fraction by entire video or subsampled clips, and
  3) assessment of cardiomyopathy with reduced ejection fraction.

For more details, see the acompanying paper,

> **Interpretable AI for beat-to-beat cardiac function assessment**<br/>
  by David Ouyang, Bryan He, Amirata Ghorbani, Curt P. Langlotz, Paul A. Heidenreich, Robert A. Harrington, David H. Liang, Euan A. Ashley, and James Y. Zou

Dataset
-------
We share a deidentified set of 10,000 echocardiogram images which were used for training EchoNet-Dynamic.
Preprocessing of these images, including deidentification and conversion from DICOM format to AVI format videos, were performed with OpenCV and pydicom. Additional information is at https://douyang.github.io/EchoNetDynamic/. These deidentified images are shared with a non-commerical data use agreement.

Examples
--------

We show examples of our semantic segmentation for nine distinct patients below.
Three patients have normal cardiac function, three have low ejection fractions, and three have arrhythmia.
No human tracings for these patients were used by EchoNet-Dynamic.

| Normal                                 | Low Ejection Fraction                  | Arrhythmia                             |
| ------                                 | ---------------------                  | ----------                             |
| ![](docs/media/0X10A28877E97DF540.gif) | ![](docs/media/0X129133A90A61A59D.gif) | ![](docs/media/0X132C1E8DBB715D1D.gif) |
| ![](docs/media/0X1167650B8BEFF863.gif) | ![](docs/media/0X13CE2039E2D706A.gif ) | ![](docs/media/0X18BA5512BE5D6FFA.gif) |
| ![](docs/media/0X148FFCBF4D0C398F.gif) | ![](docs/media/0X16FC9AA0AD5D8136.gif) | ![](docs/media/0X1E12EEE43FD913E5.gif) |

Installation
------------

EchoNet-Dynamic is implemented for Python 3, and depends on the following packages:
  - NumPy
  - PyTorch
  - Torchvision
  - OpenCV
  - skimage
  - sklearn
  - tqdm

Echonet-Dynamic and its dependencies can be installed by running

    pip3 install .

