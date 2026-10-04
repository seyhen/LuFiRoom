import { Texture } from 'three'

// Vus de biais, le parquet, le tartan ou l'osier scintillent : on filtre toutes les textures en anisotrope (le GPU plafonne si besoin).
// À importer avant les modules qui fabriquent des textures : la valeur est lue à leur création.
Texture.DEFAULT_ANISOTROPY = 8
