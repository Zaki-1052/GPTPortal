{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "image-downloader";
  nativeBuildInputs = [
    pkgs.nodejs
  ];
  shellHook = ''
    export NODE_PATH=$PWD/.nix-node;
    export NPM_CONFIG_PREFIX=$PWD/.nix-node;
    export PATH=$NODE_PATH/bin:$PATH;

    mkdir -p .nix-node
    npm config set prefix $NODE_PATH
  '';
}
