# Yaml-To-Fstab

An http service that converts a filesystem mounts yaml file to fstab.

## Example :

input.yaml
```
fstab:
  /dev/sda1:
    mount: /boot
    type: xfs
  /dev/sda2:
    mount: /
    type: ext4
  /dev/sdb1:
    mount: /var/lib/postgresql
    type: ext4
    root-reserve: 10%
  192.168.4.5:
    mount: /home
    export: /var/nfs/home
    type: nfs
    options:
      - noexec
      - nosuid
```

to

```
/dev/sda1      /boot       xfs        defaults     0 0
/dev/sda2      /       ext4        defaults     0 0
/dev/sdb1      /var/lib/postgresql       ext4        defaults     0 0
192.168.4.5:/var/nfs/home      /home       nfs        noexec,nosuid     0 0
```

# Run service via Docker

build the image :

```
# docker build -t yaml-to-fstab:1.0 -f .\Dockerfile .
# docker run --rm -p 3030:3030 -it yaml-to-fstab:1.0
```

You can send the input.yaml file as a multipart/form-data via post request and receive the fstab response like so :


# Call the service

```
curl -sF file=@input.yaml -X POST -s http://<service url>:3030/api/parse
```