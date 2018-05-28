# Criterion Collection Closet Picks Data Visualization

This generates a web page that displays data associated with the tastes of the people who appear in the _Closet Picks_ video series from [the Criterion Collection](https://criterion.com) (I'm not associated with Criterion in any way, beyond enjoying their releases).

## Run

The code base requires Python 3.x.

To run a version of this page locally, at localhost:3000, run:

``` bash
python3 criterion-closet-picks.py host
```

To generate a version to host on a webpage, run:

``` bash
python3 criterion-closet-picks.py build
```
and copy the contents of the `bin` folder to your website.

## Data
The code expects four CSV files in the `data` folder: `data/countries.csv`, `data/directors.csv`, `data/movies.csv`, and `data/visits.csv`.

Here are the expectations for an example row in each file:

### data/countries.csv

``` csv
<name>,<search>
```
Where `name` is a string that is the name of the country, and `search` is a string that can search for this country on the Criterion website.

### data/directors.csv

``` csv
<name>,<search>
```
Where `name` is a string that is the name of the director, and `search` is a string that can search for this director on the Criterion website.

### data/movies.csv

``` csv
<spine>,<name>,<directors>,<countries>,<year>,<url>
```
Where `spine` is a number that is the corresponding spine number of the movie in Criterion, `name` is a string that is the name of the movie, `directors` is a space separated list of numbers that are the row numbers in `data/directors.csv` of the movie's directors, `countries` is a space seperated list of numbers that are the row numbers in `data/countries.csv` of the movie's country of production, `year` is a number that is the year the movie was released, and `url` is a string that corresponds to the url of the movie on the Criterion website.

### data/visits.csv

``` csv
<date>,<visitors>,<url>,<is-group>,<on-criterion>,<bagged>,<mentioned>,<notes>
```
Where `date` is a timestamp that is when the video was published, `visitors` is a string that is the people list the people that are in the visit, `url` is a string that corresponds to the YouTube upload of this video, `is-group` is a Boolean that indicates if the visitors is more than 1, `on-criterion` is a number (or null) that corresponds to the row number in `data/directors.csv` that matches one of the visitors, `bagged` is a space separated list of numbers that are the row numbers in `data/movies.csv` of the movies the visitor(s) bagged, `mentioned` is a space separated list of numbers that are the row numbers in `data/movies.csv` of the movies the visitor(s) mentioned, and `notes` is a string that indicates any quirks with how the data is notated for this visit.

## Data collection rules

Since not all Criterion box sets have spine numbers, and several visitors took Criterion box sets, we need a means of representating the sorts of movies they took - here is my rationale:

- if the box set has a spine number, reference it directly (there is no issue)
- if the box set doesn't have a spine number, but one of its discs does, reference one of the discs and discuss that in the visits `notes`
- if the box set doesn't have a spine number, and none of its discs has one either, then don't substitute any spine, and state that missing box set in `notes`

