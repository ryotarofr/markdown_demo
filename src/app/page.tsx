import fs from 'fs';
import path from 'path';
import MDX from '@/util/MarkdownLexer';
import styles from "./page.module.css";

export default function Page() {
  const publicDir = path.join(process.cwd(), 'public');
  const allFiles = fs.readdirSync(publicDir);
  const jsFiles = allFiles.filter(file => file.endsWith('.js'));

  return (
    <div className={styles.page}>
      <MDX md="# Hello World!!!" customComponentPath={jsFiles} />
    </div >
  );
}
