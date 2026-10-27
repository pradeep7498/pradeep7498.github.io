/**
 * Particle field shaders (GLSL).
 * PARTICLE_VERTEX_SHADER moves every particle between four shapes:
 *   0 sphere, 1 stream, 2 lattice, 3 orbiting disc (uniform uState blends them).
 * PARTICLE_FRAGMENT_SHADER draws each particle as a soft round dot.
 */

const PARTICLE_VERTEX_SHADER = `
uniform float uTime, uState, uR, uPR, uSize, uMotion;
uniform vec2 uView;           // visible world width/height at z=0
uniform vec3 uMouse;          // mouse on z=0 plane
uniform vec2 uShift;          // fraction of the view to slide the shape
uniform float uMouseOn;
attribute vec3 aSphere, aLattice, aDisc;
attribute vec4 aStream;       // t, lane, jitterY, jitterZ
attribute float aRand;
varying float vAlpha;
varying float vTone;          // 0 paper, 1 signal, 2 data

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float stage(float s, float k){
  return smoothstep(0., 1., clamp((s - k) * 1.35 - aRand * .35, 0., 1.));
}
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

void main(){
  float t = uTime * uMotion;

  // A — sphere, breathing with noise along its normal
  vec3 n = normalize(aSphere);
  float d = snoise(n * 1.1 + vec3(0., 0., t * .16)) * .13 + snoise(n * 2.4 - t * .08) * .025;
  vec3 A = n * uR * (1. + d);
  A.xz = rot(t * .08) * A.xz;

  // B — stream: seven lanes flowing left to right
  float lane = aStream.y;
  float u = fract(aStream.x + t * (.035 + lane * .004));
  float x = (u - .5) * uView.x * 1.1;
  float laneY = (lane - 3.) * uView.y * .085;
  float wave = sin(x * 1.3 + lane * 1.7 + t * .4) * uView.y * .035;
  vec3 B = vec3(x, laneY + wave + aStream.z * .05, aStream.w * .35);

  // C — lattice, slowly turning
  vec3 C = aLattice * uR * 1.05;
  C.xz = rot(t * .06 + .6) * C.xz;
  C.yz = rot(.42) * C.yz;

  // D — dust disc, orbiting, tilted
  vec3 D = aDisc * uR * 1.5;
  D.xy = rot(t * .05 * (1.2 - length(aDisc.xy))) * D.xy;
  D.yz = rot(1.15) * D.yz;

  vec3 p = mix(A, B, stage(uState, 0.));
  p = mix(p, C, stage(uState, 1.));
  p = mix(p, D, stage(uState, 2.));

  p.xy += uShift * uView;

  // pointer: a soft push away from the cursor
  vec2 dm = p.xy - uMouse.xy;
  float f = exp(-dot(dm, dm) / (uR * uR * .18)) * uMouseOn;
  p.xy += normalize(dm + 1e-4) * f * uR * .22;

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * (1. + aRand * .9) * (6. / -mv.z);

  vAlpha = clamp(.35 + aRand * .65, 0., 1.) * smoothstep(-12., -3., mv.z);
  vTone = aRand > .985 ? 1. : (aRand > .93 ? 2. : 0.);
}`;
const PARTICLE_FRAGMENT_SHADER = `
uniform vec3 uPaper, uSignal, uData;
uniform float uAlpha;
varying float vAlpha;
varying float vTone;
void main(){
  vec2 c = gl_PointCoord - .5;
  float r = length(c);
  float a = smoothstep(.5, .15, r) * vAlpha * uAlpha;
  vec3 col = vTone > 1.5 ? uData : (vTone > .5 ? uSignal : uPaper);
  if (vTone > .5) a *= 1.6;
  gl_FragColor = vec4(col * a, a);
}`;
