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
		return Code.split(/([^\w])/).filter(x=>!!x);
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
			let Tk = {Value:Token,Type:"Syntax"};
			if(String(Token.match(/\w+/))===Token){
				Tk.Type = "Identifier";
			}if(Token==="\""){
				let B=this.GetBetween(Stack,"\"","\"",true);
				Tk.Value=this.CompileString(B);
				Tk.Type = "String";
			}if(Token==="'"){
				let B=this.GetBetween(Stack,"'","'",true);
				Tk.Value=this.CompileString(B);
				Tk.Type = "String";
			}
			Result.push(Tk);
			Stack.Next();
		}
		return Result;
	},
	EscapeStringLiteral(Literal){
		if(Literal.match(/^u[0-9]+/)){
			return String.fromCharCode(+Literal.match(/[0-9]+/));
		}
		switch (Literal) {
			case "r": return"\r";
			case "n": return"\n";
			case "b": return"\b";
			case "t": return"\t";
			case "c": return"\c";
			case "f": return"\f";
			case "v": return"\v";
			case "t": return"\t";
			default: return Literal;
		}	
	},
	CompileString(List){
		let R="";
		for(let L of List){
			let Add=undefined;
			if(L.ESCAPED===true){
				let M=L.match(/^u[0-9]+/),
					LEN=1;
				if(M)LEN=String(M).length;
				if(L.length>1)Add=L.substr(LEN,L.length),L=L.substr(0,LEN);
				L=this.EscapeStringLiteral(L);
			}
			R+=L;
			if(Add)R+=Add;
		}
		return R;
	},
	GetBetween(Stack,T1,T2,AllowEscapes=false){
		let Between = [];
		if(Stack.Token===T1)Stack.Next();
		if(Stack.Token===T2)return Between;
		while(!Stack.IsEnd()){
			if(Stack.Token===T2)break;
			let T = Stack.Token;
			if(AllowEscapes&&T==="\\"){
				T=Stack.Next();
				T.ESCAPED=true;
			}
			Between.push(T);
			Stack.Next();
		}
		return Between;
	},
	RemoveWhitespace(List){
		return List.filter(x=>x.Value.match(/\s+/)!=x.Value);
	},
	ApplyLineNumbers(List){
		let Line=1,Index=1;
		let R=[];
		for(let L of List){
			if(L.Value==="\n"||L.Value==="\r")Line++,Index=0;
			L.Line=Line,
				L.Index=Index;
			Index+=L.Value.length;
			R.push(L);
		}
		return R;	
	},
	Parse(Code){
		return this.RemoveWhitespace(this.ApplyLineNumbers(this.GenerateTypes(this.Compress(this.Split(Code)))));
	},
};
