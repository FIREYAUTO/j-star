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
