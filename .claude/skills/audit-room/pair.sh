#!/bin/bash
# pair.sh dossier pièce [x y w h]
# Assemble <dossier>/<pièce>-d.png (jour) et <pièce>-n.png (nuit) côte à côte dans <dossier>/pair-<pièce>.png.
# Sans zone, recadre la pièce au centre de l'écran 1440×900 (120 125 1200 640) ; en mobile (390×844), passe la zone voulue.
dir="$1"; room="$2"; z="${3:-120} ${4:-125} ${5:-1200} ${6:-640}"
read -r x y w h <<<"$z"
ffmpeg -y -loglevel error -i "$dir/$room-d.png" -i "$dir/$room-n.png" \
  -filter_complex "[0:v]crop=$w:$h:$x:$y[a];[1:v]crop=$w:$h:$x:$y[b];[a][b]hstack" "$dir/pair-$room.png"
