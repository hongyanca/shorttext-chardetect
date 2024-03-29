/* eslint-disable no-console */
const iconv = require('iconv-lite');
const jschardet = require('jschardet');
const shortTextCharDetect = require('../index');

const MBCS_ENCODINGS = ['GB2312', 'Big5', 'SHIFT_JIS'];

const latin1StringToUint8Array = (string) => {
  return Uint8Array.from(Buffer.from(string, 'latin1'));
};

const testStrings = [
  // Big5
  '\x74\x6f\x6d\x61\x6c\x6f\x37\x35\x31\x36\x40\x77\x77\x77\x2e\x73\x65\x78\x69\x6e\x73\x65\x78\x2e\x6e\x65\x74\x40\xad\xb8\xb3\xbe\xac\x75\xb5\x75\xbd\x67\xb6\xb0',
  // 游侠网NETSHOW.exe
  '\xd3\xce\xcf\xc0\xcd\xf8\x4e\x45\x54\x53\x48\x4f\x57\x2e\x65\x78\x65',
  // 此文件，É升�邡錉itComet(比特彗星)0.85或以上版本____   <- Corrupted
  '\xa6\xb9\xa4\xe5\xa5\xf3\xa1\x41\x88\x5b\xa4\xc9\x83\xcb\xa8\xec\x42\x69\x74\x43\x6f\x6d\x65\x74\x28\xa4\xf1\xaf\x53\xb1\x6b\xac\x50\x29\x30\x2e\x38\x35\xa9\xce\xa5\x48\xa4\x57\xaa\xa9\xa5\xbb\x5f\x5f\x5f\x5f',
  // 0924-M111桌球女郎1
  '\x30\x39\x32\x34\x2d\x4d\x31\x31\x31\xd7\xc0\xc7\xf2\xc5\xae\xc0\xc9\x31',
  // 游侠网凤凰棋牌游戏.exe <- Low confidence KOI8-R
  '\xd3\xce\xcf\xc0\xcd\xf8\xb7\xef\xbb\xcb\xc6\xe5\xc5\xc6\xd3\xce\xcf\xb7\x2e\x65\x78\x65',
  // 落鸟.rmvb
  '\xc2\xe4\xc4\xf1\x2e\x72\x6d\x76\x62',
  // SpeedPluss論壇.url  <- problem!!!
  '\x53\x70\x65\x65\x64\x50\x6c\x75\x73\x73\xd5\x93\x89\xaf\x2e\x75\x72\x6c',
  '\xb3\xe0\xc2\xe3\xb9\xac\xb5\xee\x20\x2d\x20\x50\x61\x6c\x61\x63\x65\x4e\x61\x6b\x65\x64\x2e\x75\x72\x6c',
  // AVKU網址發佈頁.url <- Low confidence
  '\x41\x56\x4b\x55\xbe\x57\xd6\xb7\xb0\x6c\x81\xd1\xed\x93\x2e\x75\x72\x6c',
  '\xb5\xcd\xd0\xd8\xd3\xd5\xbb\xf3\x20\x41\x2e\x72\x6d',
  // 3p夏川.rmvb KOI8-R
  '\x33\x70\xcf\xc4\xb4\xa8\x2e\x72\x6d\x76\x62',
  // (OVA) 雲界の迷宮 ZEGUY (LD 640x480)(OVA) 雲界の迷宮  <-   SHIFT_JIS
  '\x28\x4f\x56\x41\x29\x20\x89\x5f\x8a\x45\x82\xcc\x96\xc0\x8b\x7b\x20\x5a\x45\x47\x55\x59\x20\x28\x4c\x44\x20\x36\x34\x30\x78\x34\x38\x30\x29\x28\x4f\x56\x41\x29\x20\x89\x5f\x8a\x45\x82\xcc\x96\xc0\x8b\x7b',
  // Incorrect frequency, decided by size.
  '\x43\x45\x4e\x2d\x30\x31\x32\x2d\x58\x76\x69\x44\x32\x63\x65\x6e\x30\x31\x32\x70\x6c\x2e\x6a\x70\x67\x43\x45\x4e\x2d\x30\x31\x32\x2e\x61\x76\x69\x48\x4b\x2d\x39\x39\x50\x32\x50\x20\x2d\x20\x50\x6f\x77\x65\x72\x65\x64\x20\x62\x79\x20\x44\x69\x73\x63\x75\x7a\x21\x2e\x75\x72\x6c\xb3\xd5\x9d\x68\xbe\xe3\x98\xb7\xb2\xbf\x7e\x83\x9e\xd9\x7c\xd5\x93\x89\xaf\x20\xb3\xd5\x9d\x68\xbe\xe3\x98\xb7\xb2\xbf\x2c\x68\x74\x74\x70\x2d\x2d\x77\x77\x77\x2e\x70\x69\x72\x69\x6e\x67\x2e\x63\x6f\x6d\x2d\x62\x62\x73\x2d\x74\x63\x6e\x20\x2d\x20\x50\x6f\x77\x65\x72\x65\x64\x20\x62\x79\x20\x44\x69\x73\x63\x75\x7a\x21\x2e\x75\x72\x6c\xc4\xfa\x5f\x39\x39\x70\x32\x70\x2e\x63\x6f\x6d\x2e\x74\x78\x74\xc4\xfa\x5f\x66\x64\x7a\x6f\x6e\x65\x2e\x6f\x72\x67\x2e\x74\x78\x74\xc4\xfa\x5f\x68\x6b\x70\x6c\x61\x7a\x61\x2e\x6e\x65\x74\x2e\x74\x78\x74\xc4\xfa\x5f\x77\x77\x77\x2e\x70\x69\x72\x69\x6e\x67\x2e\x63\x6f\x6d\x2e\x74\x78\x74\xcf\xe3\xb8\xdb\x8f\x56\x88\xf6\x20\x2d\x20\x50\x6f\x77\x65\x72\x65\x64\x20\x62\x79\x20\x44\x69\x73\x63\x75\x7a\x21\x2e\x75\x72\x6c',
  '\x5b\x45\x41\x43\x5d\x20\x28\xa5\xb2\xa9\x60\xa5\xe0\xa5\xb5\xa5\xf3\xa5\xc8\xa5\xe9\x29\x20\xc6\xe9\xd4\xaa\xc8\xca\x20\x2d\x20\x46\x49\x4e\x41\x4c',
  
  // Windows-1251 confused with Big5/GB2312
  '\xd7\xf2\xee\x20\xf2\xe0\xea\xee\xe5\x20\xea\xf0\xe0\xf1\xee\xf2\xe0\x5f\x44\x56\x42\x5f\x62\x79\x5f\x43\x4c\x49\x50\x4d\x41\x4e\x2e\x6d\x70\x67',
  '\x45\x6c\x65\x6e\x69\x20\x2d\x20\x5a\x61\x20\x77\x73\x7a\x79\x73\x74\x6b\x69\x65\x20\x6e\x6f\x63\x65\x2c\x20\x5a\xb3\x6f\x74\x61\x20\x6b\x6f\x6c\x65\x6b\x63\x6a\x61\x20\x28\x31\x39\x39\x39\x29\x30\x31\x20\x2d\x20\x4d\x69\xb3\x6f',
  '\xca\xcb\xc8\xcf\xdb\x21\xc1\xe5\xeb\xe0\xff\x20\xed\xee\xf7\xfc\x2e\x61\x76\x69\x21\xc1\xe5\xeb\xe0\xff\x20\xf0\xe5\xea\xe0\x2e\x61\x76\x69\x21\xc4\xee\xe6\xe4\xfc\x2e\x61\x76\x69\x21\xca\xee\xed\xe2\xe5\xe9\xe5\xf0\x2e\x61\x76\x69\x21\xca\xf0\xfb\xf1\xe0\x2e\x61\x76\x69\x21\xcb\xfe\xe1\xee\xe2\fc\x2e\x61\x76\x69\x21\xcc\xb8\xf0\xf2\xe2\xfb\xe9\x20\xe3\xee\xf0\xee\xe4\x2e\xd0\xee\xe6\xe4\xe5\xf1\xf2\xe2\xee\x2e\x61\x76\x69\x21\xcd\xe5\xe1\xee\x20\xed\xe0\x20\xe7\xe5\xec\xeb\xe5\x2e\x61\x76\x69\x21\xce\xe4\xed\xee\xf0\xe0\xe7\xee\xe2\xe0\xff'
];


testStrings.map(testString => {
  console.log(jschardet.detect(testString));
  const buffer = latin1StringToUint8Array(testString);
  const encoding = shortTextCharDetect(buffer);
  // console.log(`Windows-1251 >>> ${iconv.decode(buffer, 'Windows-1251')}`);
  console.log(`${encoding} >>> ${iconv.decode(buffer, encoding)}`);

  // MBCS_ENCODINGS.map(encoding => {
  //   const decoded = iconv.decode(buffer, encoding);
  //   console.log(`decode using ${encoding} -> ${decoded}`);
  // });

  console.log('----------------------------------------------------------------');
});

// const bufferToHexString = buffer =>
//   buffer.reduce((prev, curr) => `${prev}\\x${('0'+curr.toString(16)).slice(-2)}`, '');