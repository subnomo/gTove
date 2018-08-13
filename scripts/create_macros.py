import csv
from urllib.parse import quote

with open('Spells.csv') as infile:
    reader = csv.reader(infile)

    with open('macros.csv', mode='w') as outfile:
        writer = csv.writer(outfile)

        for i, row in enumerate(reader):
            if i == 0:
                writer.writerow(['Macro Name', 'Entity Type', 'Attribute Display Name', 'Value'])
            else:
                name = row[0]
                desc = row[8]
                link = 'https://roll20.net/compendium/dnd5e/{}'.format(quote(name))

                writer.writerow([name, 'url', 'Roll20 Spell', link])
                writer.writerow([name, 'text', 'Spell Description', desc])

    print('Done!')
