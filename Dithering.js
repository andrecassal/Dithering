
class Dither {
  constructor(sourceImage) {
    this.img = sourceImage;

    this.pxl = []; //img.pixels pointer;
    this.FACTOR = 1; //factor
    this.blk = 1;
    this.R = 0;
    this.G = 1;
    this.B = 2;
    this.A = 3;
    //Floyd Steinberg Kernel
    this.K = [  [0,      0,       7/16.0],
                [3/16.0,  5/16.0,  1/16.0]];
    //ATKINSON Kernel //NOT IMPLEMENTED
	// X	1/8	  1/8
	// 1/8	1/8	  1/8
	// 1/8 
    
  }
  index(x, y, chn) {
    return ((x + y * this.img.width) * 4) + chn;
  }
  pixel(x, y, chn, value) {
    if (value != undefined) {
      this.img.pixels[this.index(x, y, chn)] = value;
    }
    return this.img.pixels[this.index(x, y, chn)];
  }
  __factor(clr) {
    return round(this.FACTOR * clr / 255) * floor(255 / this.FACTOR);
  }
  __factor_error(x, y, chn, orgn) {
    let clr = this.pixel(x, y, chn);
    return orgn - this.__factor(clr);
  }
  __distribute(x, y, err, errFactor) {
    this.img.pixels[this.index(x, y, this.R)] += err.R * errFactor;
    this.img.pixels[this.index(x, y, this.G)] += err.G * errFactor;
    this.img.pixels[this.index(x, y, this.B)] += err.B * errFactor;
  }
  scan() {
    // Possible bug with this cleaning canvas;
    // pixelDensity(1)
    this.img.loadPixels();
    
    for (let y = 0; y < this.img.height; y+=this.blk) {
      for (let x = 1; x < this.img.width - 1; x+=this.blk) {

        let R = this.pixel(x, y, this.R);
        let G = this.pixel(x, y, this.G);
        let B = this.pixel(x, y, this.B);

        this.pixel(x, y, this.R, this.__factor(R));
        this.pixel(x, y, this.G, this.__factor(G));
        this.pixel(x, y, this.B, this.__factor(B));

        let err = {
          R : this.__factor_error(x, y, this.R, R),
          G : this.__factor_error(x, y, this.G, G),
          B : this.__factor_error(x, y, this.B, B),
        }

        // original 7,3,5,1
        this.__distribute(x + 1, y + 0, err, this.K[0][2])
        this.__distribute(x - 1, y + 1, err, this.K[1][0])
        this.__distribute(x + 0, y + 1, err, this.K[1][1])
        this.__distribute(x + 1, y + 1, err, this.K[1][2])

        let clr = color(this.pixel(x,y,this.R),
                      this.pixel(x,y,this.G),
                      this.pixel(x,y,this.B))
        this.onIterate(x, y, clr, err, this.pxl);
      }
    }
    // this.img.updatePixels();
    // image(this.img,0,0)
  }
  onPixelLoop(x, y, clr, err, pxl) {}
}

