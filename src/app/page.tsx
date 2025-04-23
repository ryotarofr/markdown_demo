import fs from 'fs';
import path from 'path';
import MDX from '@/components/Mdx';
import styles from "./page.module.css";
import CodeMirror from '@/components/codemirror';

export default function Page() {
  const publicDir = path.join(process.cwd(), 'public');
  const allFiles = fs.readdirSync(publicDir);
  const jsFiles = allFiles.filter(file => file.endsWith('.js'));

  return (
    <div className={styles.page}>
      <MDX md="# Hello World!!!" customComponentPath={jsFiles} />
      <CodeMirror />
    </div >
  );
}
