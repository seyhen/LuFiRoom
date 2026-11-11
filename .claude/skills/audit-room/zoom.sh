#!/bin/bash
# zoom.sh in.png out.png w h x y [largeur]
# Recadre une zone de la capture et l'agrandit (1100 px de large par défaut), pour regarder un objet en gros plan.
ffmpeg -y -loglevel error -i "$1" -vf "crop=$3:$4:$5:$6,scale=${7:-1100}:-1:flags=lanczos" "$2"
