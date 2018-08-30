import re
import csv
from urllib.parse import quote


# DnDBeyond url encoder
def encode(name):
    name = name.replace(' ', '-')
    return re.sub('[^A-Za-z0-9-]+', '', name)

with open('Spells.csv') as infile:
    reader = csv.reader(infile)

    with open('macros.csv', mode='w') as outfile:
        writer = csv.writer(outfile)

        for i, row in enumerate(reader):
            if not row:
                continue

            if i == 0:
                writer.writerow(['Macro Name', 'Entity Type', 'Attribute Display Name', 'Value'])
            else:
                name = row[0]
                desc = row[8]
                r20 = 'https://roll20.net/compendium/dnd5e/{}'.format(quote(name))
                dbeyond = 'https://dndbeyond.com/spells/{}'.format(encode(name))

                writer.writerow([name, 'url', 'Roll20 Spell', r20])
                writer.writerow([name, 'url', 'DnDBeyond Spell', dbeyond])
                writer.writerow([name, 'text', 'Spell Description', desc])

    print('Done!')
