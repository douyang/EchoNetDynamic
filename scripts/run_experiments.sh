#!/bin/bash

for pretrained in True False
do
    for model in r2plus1d_18 r3d_18 mc3_18
    do
        for frames in 96 64 32 16 8 4 1
        do
            batch=$((256 / frames))
            batch=$(( batch > 16 ? 16 : batch ))

            logfile=output/video/${model}_${frames}_1_
            if [ "${pretrained}" = True ]
            then
                logfile=${logfile}pretrained
            else
                logfile=${logfile}random
            fi
            logfile=${logfile}/log.csv
            cmd="import echonet; echonet.utils.video.run(modelname=\"${model}\", frames=${frames}, period=1, pretrained=${pretrained}, batch_size=${batch})"
            python3 -c "${cmd}"
        done
        for period in 2 4 6 8
        do
            batch=$((256 / 64 * period))
            batch=$(( batch > 16 ? 16 : batch ))
            logfile=output/video/${model}_$((64 / period))_${period}_
            if [ "${pretrained}" = True ]
            then
                logfile=${logfile}pretrained
            else
                logfile=${logfile}random
            fi
            logfile=${logfile}/log.csv
            cmd="import echonet; echonet.utils.video.run(modelname=\"${model}\", frames=(64 // ${period}), period=${period}, pretrained=${pretrained}, batch_size=${batch})"
            python3 -c "${cmd}"
        done
    done
done

period=2
pretrained=True
for model in r2plus1d_18 r3d_18 mc3_18
do
    cmd="import echonet; echonet.utils.video.run(modelname=\"${model}\", frames=(64 // ${period}), period=${period}, pretrained=${pretrained}, run_test=True)"
    python3 -c "${cmd}"
done

python3 -c "import echonet; echonet.utils.segmentation.run(modelname=\"deeplabv3_resnet50\",  save_segmentation=True, pretrained=False)"
