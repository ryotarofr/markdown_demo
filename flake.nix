{
  description = "Minimal flake for remark-markdown-unist";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";  # 必要に応じてシステムを変更
      pkgs = import nixpkgs { inherit system; };
    in {
      packages.default = pkgs.stdenv.mkDerivation {
        pname = "remark-markdown-unist";
        version = "0.1";
        src = self;
        phases = [ "installPhase" ];
        installPhase = ''
          mkdir -p $out
          cp -r * $out/
        '';
      };

      devShell.x86_64-linux = pkgs.mkShell {
        buildInputs = [ /* 必要なパッケージ */ ];
      };
    };
}
