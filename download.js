import fs from 'fs';

async function download() {
  try {
    const res1 = await fetch('https://www.reddit.com/r/tollywood/comments/1cyx7ez/what_are_ur_thoughts_on_this_movie/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html1 = await res1.text();
    const match1 = html1.match(/https:\/\/preview\.redd\.it\/[^"?'\s]+/);
    if (match1) {
      console.log('Found Reddit image:', match1[0]);
      const imgRes = await fetch(match1[0]);
      fs.writeFileSync('public/rat.jpg', Buffer.from(await imgRes.arrayBuffer()));
    } else {
      console.log('Reddit image not found');
    }

    const res2 = await fetch('https://x.com/LuffySalaar/status/1671573211966996480', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html2 = await res2.text();
    const match2 = html2.match(/https:\/\/pbs\.twimg\.com\/media\/[^"?'\s]+/);
    if (match2) {
      console.log('Found Twitter image:', match2[0]);
      const imgRes = await fetch(match2[0]);
      fs.writeFileSync('public/snake.jpg', Buffer.from(await imgRes.arrayBuffer()));
    } else {
      console.log('Twitter image not found');
    }
  } catch (e) {
    console.error(e);
  }
}

download();
