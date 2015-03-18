#!/usr/bin/env bash
# suffixer
#
# remove _unit.py suffix

for FN in *_unit.py
do
    mv "${FN}" "${FN/_unit.py/.py}"
done
