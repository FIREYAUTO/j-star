//{{ Stack }}\\

class BaseStack {
	constructor(Tokens){
		this.Tokens=Tokens,
			this.Position=0,
			this.Token=Tokens[0],
			this.Length=Tokens.length;
	}
	Next(Amount=1){
		return this.Token=this.Tokens[this.Position+=Amount];	
	}
	IsEnd(){
		return this.Position >= this.Length;
	}
}

//{{ Tokens }}\\

const Tokens = [
	"==",
	"<=",
	">=",
	"!=",
];

//{{ Tokenizer }}\\

const JsT = {
	Split(Code=""){
		return Code.split(/([^\w]|^\d+)/).filter(x=>!!x);
	},
	Compress(List){
		let Result = [],
			Stack = new BaseStack(List);
		while(!Stack.IsEnd()){
			let Token = Stack.Token;
			if(Token.length==1){
				let P=Stack.Position;
				let Matches = [];
				for(let T of Tokens){
					let M = 0;
					for(let i=0,l=T.length;i<l;i++)
						if(List[P+i]==T[i])M++;
						else break;
					if(M===T.length){
						Matches.push(T);
						Token=T;
					}
				}
				if(Matches.length>0){
					Matches=Matches.sort((a,b)=>a.length>b.length?-1:a.length<b.length?1:0);
					Token=Matches[0];
					Stack.Next(Token.length);
				}else Stack.Next();
			}else Stack.Next();
			Result.push(Token);
		}
		return Result;
	},
	GenerateTypes(List){
		let Result = [],
			Stack = new BaseStack(List);
		while(!Stack.IsEnd()){
			let Token = Stack.Token;
			if(Token.match(/\w+/)===Token){
				Token.TYPE = "Identifier";	
			}
			Result.push(Token);
		}
		return Result;
	},
	RemoveWhitespace(List){
		return List.filter(x=>!x.match(/\s/));
	},
	Parse(Code){
		return this.RemoveWhitespace(this.GenerateTypes(this.Compress(this.Split(Code))));
	}
};
