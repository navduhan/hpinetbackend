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
    
    return final_results


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


host_genes = sys.argv[1]
pathogen_genes = sys.argv[2]
host = sys.argv[3]
pathogen = sys.argv[4]
method= sys.argv[5]
score =sys.argv[6]
threshold = sys.argv[7]

ptable= f"go_{pathogen}"
htable= f"go_{host}"


try:
    results = goPPI(ptable,htable,method,score,threshold )
    rid = add_results(results.to_dict('records'))
    print(rid)
except Exception:
    rid = add_noresults("no results")
    print(rid)