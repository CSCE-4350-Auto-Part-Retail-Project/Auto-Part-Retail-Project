#!/bin/bash
sudo git reset --hard HEAD
sudo git fetch https://mdl045:$1@github.com/CSCE-4350-Auto-Part-Retail-Project/Auto-Part-Retail-Project.git main
sudo git pull https://mdl045:$1@github.com/CSCE-4350-Auto-Part-Retail-Project/Auto-Part-Retail-Project.git main
sudo systemctl restart 4350_frontend.service && sudo systemctl restart 4350_backend.service 
