# qbrt-pkg

Generate binary executables of [qbrt](https://github.com/mozilla/qbrt) for your HTML5 Web Apps.

For more details, refer to [qbrt's GitHub project page](https://github.com/mozilla/qbrt).


## Usage

Install it via [npm](https://www.npmjs.com/):

```bash
npm install -g cvan/qbrt-pkg
```

### Packaging a qbrt app

To package an app to launch from a URL:

```bash
qbrt-pkg https://aframe.io/aframe/examples/showcase/spheres-and-fog/
```

### Running apps

There's also a command to skip the packaging and directly use qbrt to launch the app from a URL:

```bash
qbrt-launch https://aframe.io/aframe/examples/showcase/spheres-and-fog/
```


## License

All code is licensed under the [Apache License, Version 2.0](LICENSE.md).
