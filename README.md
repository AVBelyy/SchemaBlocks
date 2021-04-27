# SchemaBlocks

<img src="schema-blocks.png" alt="example schema" width="500"/>

[Scratch](https://scratch.mit.edu/)-like UI for KAIROS TA1 schema editing. Based on [Google Blockly](https://github.com/google/blockly).

## Using SchemaBlocks to produce KAIROS schemas

Step 1: set up `SchemaBlocks` locally or visit:
[https://sb.retloko.org/](https://sb.retloko.org/)

Step 2: make a schema, e.g. starting from [this example](https://drive.google.com/file/d/1FcbDBBOFBRsFtpgLmAE_PrDwrIsLK3Gs/view?usp=sharing)

Step 3: "export to XML" your schema and save it locally

Step 4: run XML-to-JSON-LD converter (see below)

Step 5: (optional) edit or extend the JSON-LD schema manually

Step 6: validate JSON-LD schema with TA3 validator: [http://validation.kairos.nextcentury.com/](http://validation.kairos.nextcentury.com/)

## Running XML-to-JSON-LD converter

Make sure to use Python>=3.6

Step 1: clone and `cd` into this repo

Step 2: set up your favorite python virtual environment (e.g. virtualenv, conda)

Step 3:
```
cd helpers
pip install -r requirements.txt
python bxml2jsonld.py [xmlpath] [jsonldpath]
```

## Citation

If you use SchemaBlocks please cite it as follows.

    @article{weber2021schema,
      title={Schema Curation via Causal Association Rule Mining},
      author={Weber, Noah and Belyy, Anton and Holzenberger, Nils and Rudinger, Rachel and Van Durme, Benjamin},
      journal={arXiv preprint arXiv:2104.08811},
      year={2021}
    }
