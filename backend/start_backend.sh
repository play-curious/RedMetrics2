#!/bin/bash

echo "** Installing dependencies ... **"
yarn
echo "** Installing dependencies done **"

echo "** Starting ... **"
yarn watch
echo "** Starting done **"
