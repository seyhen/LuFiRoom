#!/bin/bash
# sheet.sh in.png out.png "x y w h" "x y w h" ...
# Recadre chaque zone de la capture, les ramène dans une cellule de 640×560 (SHEET_H pour changer la hauteur) et les assemble en une planche (2 colonnes) :
# une seule image à lire au lieu d'une par objet. Les coordonnées sont celles de la capture (2880×1800 à densité 2).
in="$1"; out="$2"; shift 2
n=$#; [ "$n" -lt 1 ] && { echo "usage: sheet.sh in.png out.png \"x y w h\" ..."; exit 1; }
W=640; H=${SHEET_H:-560}; cols=2
filt=""; i=0
for z in "$@"; do
  read -r x y w h <<<"$z"
  filt+="[0:v]crop=$w:$h:$x:$y,scale=$W:$H:force_original_aspect_ratio=decrease:flags=lanczos,pad=$W:$H:(ow-iw)/2:(oh-ih)/2:color=0x201830[c$i];"
  i=$((i+1))
done
# chaque ligne = 2 recadrages côte à côte, puis toutes les lignes l'une sous l'autre
rows=$(( (n + cols - 1) / cols )); lines=""
for ((r=0; r<rows; r++)); do
  a=$((r*cols)); b=$((a+1))
  if [ "$b" -lt "$n" ]; then
    filt+="[c$a][c$b]hstack=inputs=2[r$r];"
  else
    filt+="[c$a]pad=$((W*2)):$H:0:0:color=0x201830[r$r];"
  fi
  lines+="[r$r]"
done
if [ "$rows" -gt 1 ]; then filt+="${lines}vstack=inputs=$rows[out]"; else filt+="[r0]copy[out]"; fi
ffmpeg -y -loglevel error -i "$in" -filter_complex "$filt" -map "[out]" "$out"
