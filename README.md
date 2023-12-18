# Final Project Rekayasa Sistem Berbasis Pengetahuan (RSBP) D 2023

## Anggota Kelompok:

- Akbar Putra Asenti Priyanto (5025211004)
- Thomas Juan Mahardika Suryono (5025211016)
- Sony Hermawan (5025211226)

## Deskripsi Projek

Tujuan dari projek ini adalah untuk membangun sebuah sistem untuk menampilkan hasil tractography sebagai objek 3D dengan menggunakan framework **ThreeJS**. Objek 3D hasil tractography tadi kemudian dapat dilakukan slicing (pemotongan) dengan sebuah plane sehingga dapat menghasilkan koordinat titik saraf otak yang presisi.

## Fitur dan Fungsionalitas Sistem

- Tractography Model Import

Sistem menerima input hasil koordinat Tractography berupa file .JSON dan dapat menampilkan model 3D berdasarkan file tersebut. Diberkan beberapa dua contoh file hasil Tractography, yaitu **./data/streamlineResult2.json** dan  **./data/streamlineResult3.json**

- View Control

User dapat mengatur posisi dan rotasi dari kamera, selain itu user juga dapat mengatur tingkat visibilitas dari model dengan menggunakan slider.

- Plane Control

User dapat mengatur tiga plane (plane X, plane Y, dan plane Z) yang digunakan dalam proses slicing serta mengatur fitur clipping dari plane tersebut.

- Intersection Detection

Sistem dapat mendeteksi, menyimpan, dan menampilkan titik-titik yang berpotongan dengan setiap clipping plane.

## Instalasi Projek

Install parcel melalui npm

```
npm install parcel -g
```

Install threejs dan dat.gui

```
npm install three
npm install dat.gui
```

Running projek melalui parcel
```
parcel ./src/index.html
```

## Screenshot Project

![image1](./images/Screenshot%202023-12-18%20135142.png)

![image2](./images/Screenshot%202023-12-18%20150823.png)

![image3](./images/Screenshot%202023-12-18%20155216.png)

![image4](./images/Screenshot%202023-12-18%20155256.png)
