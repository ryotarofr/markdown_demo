{
  description = "Minimal flake for remark-markdown-unist";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";  # 利用するシステムに合わせる
      pkgs = import nixpkgs { inherit system; };
    in {
      # defaultPackage として定義すれば、nix run で実行可能になります
      packages.x86_64-linux.default = pkgs.stdenv.mkDerivation {
        pname = "remark-markdown-unist";
        version = "0.1";
        src = self;
        phases = [ "installPhase" ];
        installPhase = ''
          mkdir -p $out/bin
          # ここでシンプルなシェルスクリプトを作成（例: 実行時にメッセージを表示）
          echo '#!/bin/sh' > $out/bin/run
          echo 'echo "remark-markdown-unist flake running!"' >> $out/bin/run
          chmod +x $out/bin/run
        '';
      };

      # オプション: アプリケーションとしても提供する場合
      apps.x86_64-linux.default = {
        type = "app";
        program = "${self.outputs.packages.x86_64-linux.default}/bin/run";
      };

      # 開発用シェルを提供する場合
      devShell.x86_64-linux = pkgs.mkShell {
        buildInputs = [ ];
      };
    };
}
