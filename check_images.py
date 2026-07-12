import urllib.request
import re

urls = [
"1504307651254-35680f356dfd",
"1517646287270-a5a9ca602e5c",
"1531834685032-c34bf0d84e79",
"1541888946425-d81bb19240f5",
"1565008447742-97f6f38c985c",
"1578328819058-b69f3a3b0f6b",
"1581092160607-ee22621dd758",
"1584622650111-993a426fbf0a",
"1589939705384-5185137a7f0f",
"1590069261209-f8e9b8642343",
"1600585154340-be6161a56a0c",
"1683120758027-72a9417db45d",
"1683121910935-9df51a09e93f",
"1744960151551-89325664e916",
"1770838773181-e1b17ec22fee",
"1773525912493-cdb088d19d64",
"1777793919219-5b1fd98af8cb"
]

for uid in urls:
    try:
        req = urllib.request.Request(f"https://unsplash.com/photos/{uid}", headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        m = re.search(r'<meta property="og:title" content="([^"]+)"', html)
        if m:
            print(f"{uid} -> {m.group(1)}")
        else:
            print(f"{uid} -> Title not found")
    except Exception as e:
        print(f"{uid} -> Error: {e}")

