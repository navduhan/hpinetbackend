from pygosemsim import download
from pygosemsim import graph
import networkx as nx
from pygosemsim import similarity
from pygosemsim import term_set
import pandas as pd
import sys
from pymongo import MongoClient
import pandas as pd
import sqlite3
from sqlite3 import Error
import time
import argparse


ver= '0.0.1'

parser = argparse.ArgumentParser(description="""goSemSim {} : a python based Go semantic similarity based host-pathogen identification package""".format(ver),
usage="""%(prog)s [options]""",
epilog="""Written by Naveen Duhan (naveen.duhan@usu.edu),
Kaundal Bioinformatics Lab, Utah State University,
Released under the terms of GNU General Public Licence v3""",    
formatter_class=argparse.RawTextHelpFormatter )

parser.add_argument("--version", action="version", version= 'goSemSim (version {})'.format(ver), help= "Show version information and exit")
parser.add_argument("--method", dest='method',help="method")
parser.add_argument("--host", dest='host', help="Host")
parser.add_argument("--pathogen", dest='pathogen', help="Pathogen")
parser.add_argument('--hgenes', dest='hgenes', type=str, help="Genes ids host")
parser.add_argument('--pgenes', dest='pgenes', type=str, help="Genes ids pathogen")
parser.add_argument('--score',dest='score', type =str)
parser.add_argument('--t',dest='threshold')




G = graph.from_resource("go-basic")


def sim_max(terms1, terms2, method):
    """Similarity score between two term sets based on maximum value
    """
    sims = []
    for t1 in terms1:
        for t2 in terms2:
            sim = method(G, t1, t2)
            if sim is not None:
                sims.append(sim)
    return round(max(sims), 3)

def sim_bma(terms1, terms2, method):
    """Similarity between two term sets based on Best-Match Average (BMA)
    """
    sims = []
    for t1 in terms1:
        row = []
        for t2 in terms2:
            sim = method(G, t1, t2)
            if sim is not None:
                row.append(sim)
        if row:
            sims.append(max(row))
    for t2 in terms2:
        row = []
        for t1 in terms1:
            sim = method(G, t1, t2)
            if sim is not None:
                row.append(sim)
        if row:
            sims.append(max(row))
    if not sims:
        return
    return round(sum(sims) / len(sims), 3)

def sim_avg(terms1, terms2, method):
    """Similarity between two term sets based on average
    """
    sims = []
    for t1 in terms1:
        for t2 in terms2:
            sim = method(G, t1, t2)
            if sim is not None:
                sims.append(sim)
    if not sims:
        return
    return round(sum(sims) / len(sims), 3)

def connection(db):
    client = MongoClient("mongodb://localhost:27017/")

    connectDB = client[db]

    return connectDB

def create_connection(db_file):
    """ create a database connection to a SQLite database """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        
    except Error as e:
        print(e)
    return conn

def goPPI(ptable,htable, hgenes, pgenes, method, score, threshold):
    go_method = {'wang': similarity.wang, 'lowest_common_ancestor': similarity.lowest_common_ancestor, 'resnik': similarity.resnik, 'lin': similarity.lin, 'pekar':similarity.pekar}
    go_score = {'bma': sim_bma, 'avg':sim_avg, 'max':sim_max}
    conn = create_connection("/home/dock_user/hpinetgosemsim.db")
    ht="("
    for id in hgenes:

        ht +="'"+id+"',"

    ht = ht[:-1]
    ht += ")"
    
    pt="("
    for id in pgenes:

        pt +="'"+id+"',"

    pt = pt[:-1]
    pt += ")"

    hquery = "SELECT * FROM {} WHERE gene IN {}  ".format(htable,ht)
    hresult = conn.execute(hquery).fetchall()
    host_results = pd.DataFrame(hresult, columns=['gene', 'term'])
    
    pquery = "SELECT * FROM {} WHERE gene IN {}  ".format(ptable,ht)
    presult = conn.execute(pquery).fetchall()
    pathogen_results = pd.DataFrame(presult, columns=['gene', 'term'])

    final = []
    c=0
    for line in host_results.values.tolist():
        for pline in pathogen_results.values.tolist():
            
            try:
                
                vavg = go_score[score](list(line[1].split("|")), list(pline[1].split("|")), go_method[method])
            except Exception:
                continue
            
        
        
            final.append([line[0], pline[0],line[1], pline[1], vavg])
        print(c)    
        c+=1

    final_go_semsim = pd.DataFrame(final, columns=['Host_Protein', 'Pathogen_Protein', 'Host_GO', 'Pathogen_GO', 'Score'])
    
    final_results = final_go_semsim[final_go_semsim['Score']>=threshold]
    
    return  final_results


def add_results(data):
    pp =connection('hpinet_results')
    name = f"hpinet{str(round(time.time() * 1000))}results"
    ptable = pp[name]
    ptable.insert_many(data)

    return name

def add_noresults(data):
    pp =connection('hpinet_results')
    name = f"hpinet{str(round(time.time() * 1000))}results"
    ptable = pp[name]
    ptable.insert_one({'result':data})

    return name

options, unknownargs = parser.parse_known_args()

ptable= f"go_{options.pathogen}"
htable= f"go_{options.host.lower()}"
method= options.method
score = options.score
threshold = options.threshold
host_genes = [s.strip() for s in options.hgenes.split(",")]
pathogen_genes = list(options.pgenes.split(","))


results = goPPI(ptable,htable,host_genes, pathogen_genes,method,score,threshold )

rid = add_results(results.to_dict('records'))
print(rid)
