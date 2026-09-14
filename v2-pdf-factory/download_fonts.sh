#!/bin/bash
mkdir -p src/fonts
curl -s -o src/fonts/PlusJakartaSans-Regular.ttf "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU79TR_Q.ttf"
curl -s -o src/fonts/PlusJakartaSans-Bold.ttf "https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_Tkn9TR_Q.ttf"
curl -s -o src/fonts/PlayfairDisplay-Regular.ttf "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.ttf"
curl -s -o src/fonts/PlayfairDisplay-Bold.ttf "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDXbtY.ttf"
echo "Fonts downloaded successfully!"
