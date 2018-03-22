# TRACEROLL PROJECT

# New Features!

  - Upload video
  - Caption for images, videos
  - Like, comment, share in Newsfeed, Theatre
  - Displaying lines as a complete drawing functionality
  - Profile Image
  - Search profiles



**Environment**

- NodeJS
- MongoDB
- [ffmpeg](https://ffmpeg.org/download.html)

**Setup ffmpeg**

**Windows**

1. Download [ffmpeg-win64](https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20180129-d4967c0-win64-static.zip) or [ffmpeg-win32](https://ffmpeg.zeranoe.com/builds/win32/static/ffmpeg-20180129-d4967c0-win32-static.zip)
2. Extract file download at any folder (e.g. C:\Program Files) and rename to **ffmpeg** for convenience

**Tree**

    C:\Program Files
    |____ ffmpeg
        |____bin
        |____doc
        |____presets
        |____LICENSE.txt
        |____README.txt

3. Add **C:\Program Files\ffmpeg\bin** to Environment Variables (Path)
4. **Done**

**Ubuntu**

1. Open terminal
2. $ sudo apt update
3. $ sudo apt install –y ffmpeg
4. **Done**

**Build &amp; Run Traceroll**

1. Extract **traceroll.zip**
2. Open terminal
3. Change current directory to **traceroll**

    $ cd traceroll
4. Install node modules

    $ npm install
5. Build project

    $ npm run build
6. Run server (Run again if server shutdown or had been changed code on Server)

    $ node app
7. **Done (localhost:8888)**

