import java.io.*;
import java.util.*;

import fig.basic.*;
import fig.exec.*;
import fig.prob.*;
import fig.record.*;
import static fig.basic.LogInfo.*;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Color;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;

// Convert an image into ASCII art.
public class ExtractPixels implements Runnable {
  @Option public String inPath;
  @Option public String text;
  @Option public double scale = 1;
  public void run() {
    try {
      BufferedImage img = inPath != null ? ImageIO.read(new File(inPath)) : new BufferedImage(100, 24, BufferedImage.TYPE_BYTE_BINARY);

      if (scale != 1) {
        AffineTransform at = new AffineTransform();
        at.scale(scale, scale);
        int newWidth = (int)(img.getWidth() * scale);
        int newHeight = (int)(img.getHeight() * scale);
        BufferedImage after = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_ARGB);
        AffineTransformOp scaleOp = new AffineTransformOp(at, AffineTransformOp.TYPE_BILINEAR);
        img = scaleOp.filter(img, after);
      }

      if (text != null) {
        Graphics g = img.getGraphics();
        Font font = new Font("Serif", Font.BOLD, 24);
        g.setFont(font);
        g.drawString(text, 8, 20);
      }

      int threshold = 100;
      System.out.println("// " + img.getWidth() + " x " + img.getHeight());
      System.out.println("var pixels = [");
      for (int r = 0; r < img.getHeight(); r++) {
        System.out.print("  '");
        for (int c = 0; c < img.getWidth(); c++) {
          Color color = new Color(img.getRGB(c, r));
          boolean b = color.getRed() > threshold || color.getGreen() > threshold || color.getGreen() > threshold;
          //System.out.print(color + " ");
          System.out.print(b ? "#" : ".");
        }
        System.out.println("',");
      }
      System.out.println("];");
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public static void main(String[] args) {
    Execution.startMainTrack = false;
    Execution.run(args, new A());
  }
}
