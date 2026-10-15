# لوحات عرض (فاتح|داكن جنبًا إلى جنب): python3 scripts/native-contact-sheets.py <light-shots> <dark-shots> <out-dir>. لا يكتب في /tmp.
import os,sys
from PIL import Image,ImageDraw
light,dark,out=sys.argv[1:4]; os.makedirs(out,exist_ok=True)
fs=sorted(f for f in os.listdir(dark) if f.endswith('.png')); N=30; w,h=150,325
for k in range(0,len(fs),N):
    ch=fs[k:k+N]; W=Image.new('RGB',(2*w*6,(h+16)*5),'white'); d=ImageDraw.Draw(W)
    for i,f in enumerate(ch):
        x,y=(i%6)*2*w,(i//6)*(h+16)
        for j,dr in enumerate((light,dark)):
            p=dr+'/'+f
            im=Image.open(p).convert('RGB').resize((w,h)) if os.path.exists(p) else Image.new('RGB',(w,h),'gray')
            W.paste(im,(x+j*w,y))
        d.text((x+2,y+h+2),f[:-4][-44:],fill='black')
    W.save(f'{out}/sheet-{k//N+1}.png',optimize=True)
print(len(fs))
