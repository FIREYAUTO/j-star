/*

AST Formatting:

	+ AST Priority Parse List
		* Contains AST Bases with priorities
	+ AST Base
		* Function which will parse a specific set of instructions
	+ AST Parse List
		* Contains AST Bases

*/

//{{ AST Parse List }}\\

class ASTParseList {
	constructor(){
		this.List = [];
	}
	Add(Base){
		if(!this.List.includes(Base))
			this.List.push(Base);
	}
}

class ASTPriorityParseList extends ASTParseList {
	constructor(){
		super();
	}
}

//{{ AST Base }}\\

class ASTBase {
	constructor(Options={},Lists=[]){
		for(let k in Options)this[k]=Options[k];
		for(let v of Lists)v.Add(this);
	}
	Generate(Stack,...Extra){
		let Node = new ASTNode(this.Type);
		for(let Method of this.ParseTree){
			let Returns = Method.Call(Stack,...Extra);
			if(Method.Returns)
				Node.Write(Method.Name,Returns);
		}
		return Node;
	}
}

//{{ AST Node }}\\

class ASTNode {
	constructor(Type){
		this.Type=Type;
		this.Data={};
	}
	Write(Name,Value){
		this.Data[Name]=Value;
	}
	Read(Name){
		return this.Data[Name];	
	}
}

//{{ AST Classes }}\\

const ASTComplexExpressions = new ASTPriorityParseList(),
	ASTExpressions = new ASTParseList(),
	ASTStatements = new ASTParseList();

const ASTClasses = {
	//{{ AST Statements }}\\
	NewVariable:new ASTBase({
		Type:"NewVariable",
		Check:function(Stack,Token){
			return Token.Value==="$";
		},
		ParseTree:[
			{
				Name:"Name",
				Call:function(Stack){
					Stack.Next();
					Stack.ExpectType("Identifier");
					return Stack.Token
				},
				Returns:true,
			},
			{
				Name:"Value",
				Call:function(Stack){
					Stack.ExpectNext("=",true);
					Stack.Next();
					return Stack.CallASTList(ASTExpressions)
				},
				Returns:true,
			},
		],
	},[ASTStatements]),
	//{{ AST Expressions }}\\
	GetVariable:new ASTBase({
		Type:"GetVariable",
		Check:function(Stack,Token){
			return Token.Value==="@";
		},
		ParseTree:[
			{
				Name:"Name",
				Call:function(Stack){
					Stack.Next();
					Stack.ExpectType("Identifier");
					return Stack.Token
				},
				Returns:true,
			},
		],
	},[ASTExpressions]),
	NewClass:new ASTBase({
		Type:"NewClass",
		Check:function(Stack,Token){
			return Token.Value==="<";
		},
		ParseTree:[
			{
				Name:"Type",
				Call:function(Stack){
					Stack.Next();
					let Type = Stack.CallASTList(ASTExpressions);
					Stack.ExpectNext(">",true);
					return Type
				},
				Returns:true,
			},
			{
				Name:"Expression",
				Call:function(Stack){
					return Stack.CallASTList(ASTExpressions)
				},
				Returns:true,
			},
		],
	},[ASTExpressions]),
};

//{{ AST Stack }}\\

class ASTStack {
	constructor(Tokens){
		this.Tokens=Tokens,
			this.Token=Tokens[0],
			this.Positon=0,
			this.TokensLength=Tokens.length;
	}
	Next(Amount=1){
		return this.Token=this.Tokens[this.Position+=Amount];
	}
	IsEnd(){
		return this.Position>=this.TokensLength;	
	}
	GetFT(Token){
		if(this.IsEnd()&&!Token)return"end of script";
		return `token ${Token.Value}`;
	}
	Error(Options){
		if(!Options.End)Options.End=this.OpenStringStates[this.OpenStringStates.length-1]||" while parsing code";
		return ErrorHandler.Error(Options);
	}
	ErrorIfEOS(Message){
		if(this.IsEnd())
			return this.Error({
				Type:"Unexpected",
				Arguments:["end of script"],
				End:Message
			});
	}
	CheckNext(Token,Move=false){
		let Next=this.Next();
		if(!Move)this.Next(-1);
		if(Next&&Next.Value===Token)return true;
		return false;
	}
	ExpectNext(Token,Move=false){
		let Next=this.Next();
		this.ErrorIfEOS();
		if(!Move)this.Next(-1);
		if(Next.Value!=Token){
			this.Error({
				Type:"ExpectedGot",
				Arguments:[this.GetFT({Value:Token}),this.GetFT(Next)],
			});
		}
	}
	Expect(Token){
		let Next=this.Token;
		this.ErrorIfEOS();
		if(Next.Value!=Token){
			this.Error({
				Type:"ExpectedGot",
				Arguments:[this.GetFT({Value:Token}),this.GetFT(Next)],
			});
		}
	}
	ExpectType(Type){
		let Next=this.Token;
		this.ErrorIfEOS();
		if(Next.Type!=Type){
			this.Error({
				Type:"ExpectedGot",
				Arguments:[Type.toLowerCase(),this.GetFT(Next)],
			});
		}
	}
	CallASTList(List){
		this.ErrorIfEOS();
		let T=this.Token;
		for(let x of List.List)
			if(x.Check(this,T))return x.Generate(this);
	}
	CallASTPriorityList(List,Priority=-1,Repeat=false,Value){
		this.ErrorIfEOS();
		let T=this.Token;
		for(let x of List.List){
			if(x.Priority<Priority)continue;
			if(x.Check(this,T)){
				let Result = x.Generate(this,Value,x.Priority);
				if(Repeat&&!x.Stop){
					this.Next();
					return this.CallASTPriorityList(List,Result[2]||x.Priority,Repeat,Result[1]);
				}
			}
		}
		return Value;
	}
}

/*
TODO: Finish making all AST nodes, make code block generation function

*/
