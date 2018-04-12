#!/usr/bin/env python
# Name: Alwan Rashid
# Student number: 10580204
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""
import re
import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup


TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    series_data = dom.find_all("div", class_ = "lister-item-content")
    all_series = []

    for series in series_data:

        # get all the data from the html
        title = series.a

        if title:
            title = title.string

        else:
            title = "Missing"

        runtime = series.find("span", class_ = "runtime")

        if runtime:
            runtime = runtime.string.rstrip(" min")

        else:
            runtime = "Missing"

        genre = series.find("span", class_ = "genre")
        cleaned_genre = "Missing"

        if genre:
            genre = genre.string
            cleaned_genre = genre.strip()


        # to remove the " " and \n in genre

        rating = series.strong

        if rating:
            rating = rating.string

        else:
            rating = "Missing"

        # -2 because the second "p" tag is the required one
        series_actors = series.find_all(class_="", href = re.compile("name"))
        tmp = ""

        # to add all the actors from the list series_actors to actors
        for actor in series_actors:
            tmp += actor.string + ", "

        # remove the last ", " for it's ugly
        actors = tmp.rstrip(", ")

        # make a dict
        all_series.append({'title' :title, 'runtime' :runtime, 'genre'
                            :cleaned_genre, 'rating' :rating, 'actors' :actors})
    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.
    #print(runtime)
    return all_series   # REPLACE THIS LINE AS WELL AS APPROPRIATE


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # write all the data to the csv file
    for data in tvseries:
        writer.writerow([data['title'], data['rating'], data['genre'], data['actors'], data['runtime']])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, tvseries)
