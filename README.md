# Recife 1:1 XR — Marco Zero, BBTS Hackathon 24h & Comunidade IV no Rec'n'Play

Experiência imersiva de **Gêmeo Digital 3D em Escala Humana Real (1:1)** combinada com **Salas Virtuais Limitadas em 360°** do **Bairro do Recife (Marco Zero)**, desenvolvida para o **Meta Quest 3S** durante o **Rec'n'Play**.

## Destaques do Projeto
- **Escala Humana Real 1:1 (`1 unidade = 1 metro`):** Olhos posicionados a `1.70m` do nível real da calçada da Praça do Marco Zero, mantendo a proporção arquitetônica exata dos edifícios históricos (`15m` a `75m`), pontes e avenidas.
- **Pipeline de Fotogrametria Tratada (`tools/extract_recife_3d.py`):**
  - Extração e decodificação direta de **9 blocos `LOD00` (`~1 km²`, 350.573 vértices)** centrados na **Rosa dos Ventos do Marco Zero (`0, 0, 0`)**.
  - Pós-processamento de texturas `2048×2048` (realce de nitidez, cor e contraste) empacotadas em arquivos **glTF 2.0 (`.glb`)** padrão.
- **6 Salas Limitadas 360° Interativas (BBTS + Comunidade IV):**
  1. **Praça do Marco Zero (Rosa dos Ventos)**
  2. **Arena BBTS — Hackathon 24h (12/11 07h30 às 13/11 07h30)**
  3. **QG Comunidade IV — Hub Tech Recife**
  4. **Rua do Bom Jesus & Praça do Arsenal**
  5. **Cais do Sertão & Armazéns do Porto**
  6. **Parque das Esculturas de Francisco Brennand**

## Como Executar Localmente
```bash
python3 -m http.server 8080
```
Acesse `http://localhost:8080` no navegador (ou via Meta Quest Browser no **Meta Quest 3S**).
