import os
from rembg import remove
from PIL import Image

images = [
    ("public/boto.png", "public/boto-emoji.png"),
    ("public/jacare.jpg", "public/jacare-emoji.png"),
    ("public/tucano.jpg", "public/tucano-emoji.png"),
    ("public/ararinha.png", "public/ararinha-emoji.png")
]

for in_path, out_path in images:
    if os.path.exists(in_path):
        print(f"Processing {in_path}...")
        input_image = Image.open(in_path)
        output_image = remove(input_image)
        output_image.save(out_path)
        print(f"Saved {out_path}")
    else:
        print(f"File {in_path} not found.")
