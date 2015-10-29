# brief-plugin-external-data

Defines a type of model called ExternalData 

The ExternalDataSource model has a fetch action which fetches data from some remote source: google drive, github api, whatever.  It can then serialize this in the briefcase data folder.  

Project specific data sources can be defined this way, and make use of shared credentials for these external services.  

# brief-plugin-franc

Integrate the franc library from the same author of mdast.  Use this to parse the language used in the briefcase and identify potential proper nouns, domain specific language terms, references to things, whatever 

# brief-plugin-react-renderer

Generate a react and react-router app which is capable of rendering a briefcase.  

This app can make use of outlines and table of contents, and a briefcase can contain its own custom views.  
