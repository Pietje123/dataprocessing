import csv
import json

csvfile = open('Bevolking_Nederland_1950-2017.csv', 'r')
jsonfile = open('Bevolking_Nederland_1950-2017.json', 'w')

fieldnames = ("Year","Total")
reader = csv.DictReader( csvfile, fieldnames)

years = []
population = []

for row in reader:
    years.append(row["Year"])
    population.append(row["Total"])

dict = {"Year": years, "Population": population}

json.dump(dict, jsonfile)
