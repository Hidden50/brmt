# brmt
This is a tool to find weaknesses in a Pokémon team, based on a Checks Compendium.

CHECKS COMPENDIUM (cc) - a text file in CompGen format, with certain keywords that have to  
     be exactly matched. I.E., the list of GSIs is proceeded by 'GSI: ', NOT 'GSI:'.         
     OUcc hosted by Tressed www.smogon.com/forums/threads/ou-checks-compendium.3545711       
     RUcc hosted by Arifeen www.smogon.com/forums/threads/ru-checks-compendium-v2.3559443    

COMPGEN FORMAT (cgf) - a lax inter-language format for any content with minisprites.        
     Lines starting with "DexNumber | Name |" will be replaced with the corresponding        
     sprite. Linebreaks are ignored; they can be used for formatting.                        
     "Newline" generates an actual linebreak in the output.                                  
     CompGen currently exports to html, png, or BBCode.                                      

CHECKS ARRAY (ca) - an Array[DexNumber][GSI..invNSI][0..k-1] with Strings in it.            
     Each string identifies a minisprite ("DexNumber | Name |").                             
     Array[DN].asHtml contains a pre-parsed version.                                         
     Array[DN].Tiebreaker contains a unique index for sorting. If the rating function        
         for two threats is a tie, their order will be decided by the Tiebreaker.            
